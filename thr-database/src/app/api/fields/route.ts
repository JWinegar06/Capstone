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

    const result = await pool.query(
      `
      SELECT
        id,
        collection_id,
        name,
        field_type,
        required,
        display_order,
        default_value,
        options,
        created_at,
        updated_at
      FROM fields
      WHERE collection_id = $1
      ORDER BY display_order, name;
      `,
      [collectionId],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Field database error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve fields.",
      },
      {
        status: 500,
      },
    );
  }
}
