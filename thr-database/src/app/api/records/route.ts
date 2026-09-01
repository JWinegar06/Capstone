import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const collectionId = searchParams.get("collectionId");

    if (!collectionId) {
      return NextResponse.json(
        {
          error: "collectionId is required.",
        },
        {
          status: 400,
        },
      );
    }

    const fieldsResult = await pool.query(
      `
        SELECT
          id,
          collection_id,
          name,
          field_type,
          required,
          display_order,
          default_value,
          options
        FROM fields
        WHERE collection_id = $1
        ORDER BY
          display_order,
          name;
        `,
      [collectionId],
    );

    const recordsResult = await pool.query(
      `
        SELECT
          id,
          collection_id,
          import_order,
          created_at,
          updated_at
        FROM records
        WHERE collection_id = $1
        ORDER BY
          import_order ASC
            NULLS LAST,
          created_at ASC,
          id ASC;
        `,
      [collectionId],
    );

    const records = recordsResult.rows;

    if (records.length === 0) {
      return NextResponse.json({
        fields: fieldsResult.rows,
        records: [],
      });
    }

    const recordIds = records.map((record) => record.id);

    const valuesResult = await pool.query(
      `
        SELECT
          record_id,
          field_id,
          value
        FROM record_values
        WHERE record_id =
          ANY($1::uuid[]);
        `,
      [recordIds],
    );

    const valuesByRecord: Record<string, Record<string, unknown>> = {};

    for (const row of valuesResult.rows) {
      if (!valuesByRecord[row.record_id]) {
        valuesByRecord[row.record_id] = {};
      }

      valuesByRecord[row.record_id][row.field_id] = row.value;
    }

    const formattedRecords = records.map((record) => ({
      ...record,

      values: valuesByRecord[record.id] ?? {},
    }));

    return NextResponse.json({
      fields: fieldsResult.rows,

      records: formattedRecords,
    });
  } catch (error) {
    console.error("Records database error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve records.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const collectionId = body.collectionId as string | undefined;

    if (!collectionId) {
      return NextResponse.json(
        {
          error: "collectionId is required.",
        },
        {
          status: 400,
        },
      );
    }

    const collectionCheck = await client.query(
      `
        SELECT id
        FROM collections
        WHERE id = $1;
        `,
      [collectionId],
    );

    if (collectionCheck.rows.length === 0) {
      return NextResponse.json(
        {
          error: "Collection not found.",
        },
        {
          status: 404,
        },
      );
    }

    await client.query("BEGIN");

    const orderResult = await client.query(
      `
        SELECT
          COALESCE(
            MAX(import_order),
            0
          ) + 1 AS next_order
        FROM records
        WHERE collection_id = $1;
        `,
      [collectionId],
    );

    const nextOrder = orderResult.rows[0].next_order;

    const recordResult = await client.query(
      `
        INSERT INTO records (
          collection_id,
          import_order
        )
        VALUES (
          $1,
          $2
        )
        RETURNING
          id,
          collection_id,
          import_order,
          created_at,
          updated_at;
        `,
      [collectionId, nextOrder],
    );

    await client.query("COMMIT");

    return NextResponse.json(recordResult.rows[0], {
      status: 201,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("Create record error:", error);

    return NextResponse.json(
      {
        error: "Unable to create record.",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
