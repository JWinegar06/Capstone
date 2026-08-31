import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const collectionId = request.nextUrl.searchParams.get("collectionId");

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
        name,
        field_type,
        display_order
      FROM fields
      WHERE collection_id = $1
      ORDER BY display_order, name;
      `,
      [collectionId],
    );

    const recordsResult = await pool.query(
      `
      SELECT
        id,
        collection_id,
        created_at,
        updated_at
      FROM records
      WHERE collection_id = $1
      ORDER BY created_at DESC;
      `,
      [collectionId],
    );

    const recordIds = recordsResult.rows.map((record) => record.id);

    let values: {
      record_id: string;
      field_id: string;
      value: unknown;
    }[] = [];

    if (recordIds.length > 0) {
      const valuesResult = await pool.query(
        `
        SELECT
          record_id,
          field_id,
          value
        FROM record_values
        WHERE record_id = ANY($1::uuid[]);
        `,
        [recordIds],
      );

      values = valuesResult.rows;
    }

    const records = recordsResult.rows.map((record) => {
      const recordValues: Record<string, unknown> = {};

      values
        .filter((value) => value.record_id === record.id)
        .forEach((value) => {
          recordValues[value.field_id] = value.value;
        });

      return {
        ...record,
        values: recordValues,
      };
    });

    return NextResponse.json({
      fields: fieldsResult.rows,
      records,
    });
  } catch (error) {
    console.error("Record database error:", error);

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
