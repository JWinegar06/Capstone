import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const client = await pool.connect();

  try {
    const { id } = await context.params;

    await client.query("BEGIN");

    const sourceRecordResult = await client.query(
      `
        SELECT
          id,
          collection_id
        FROM records
        WHERE id = $1;
        `,
      [id],
    );

    if (sourceRecordResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error: "Source record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const sourceRecord = sourceRecordResult.rows[0];

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
      [sourceRecord.collection_id],
    );

    const nextOrder = orderResult.rows[0].next_order;

    const newRecordResult = await client.query(
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
      [sourceRecord.collection_id, nextOrder],
    );

    const newRecord = newRecordResult.rows[0];

    await client.query(
      `
      INSERT INTO record_values (
        record_id,
        field_id,
        value
      )
      SELECT
        $1,
        field_id,
        value
      FROM record_values
      WHERE record_id = $2;
      `,
      [newRecord.id, id],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        record: newRecord,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Duplicate rollback error:", rollbackError);
    }

    console.error("Duplicate record error:", error);

    return NextResponse.json(
      {
        error: "Unable to duplicate record.",

        details:
          error instanceof Error ? error.message : "Unknown database error.",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
