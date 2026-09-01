import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const libraryId = searchParams.get("libraryId");

    if (!libraryId) {
      return NextResponse.json(
        {
          error: "libraryId is required.",
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
          library_id,
          name,
          description,
          display_order,
          created_at,
          updated_at
        FROM collections
        WHERE library_id = $1
        ORDER BY
          display_order,
          name;
        `,
      [libraryId],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Collections database error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve collections.",
      },
      {
        status: 500,
      },
    );
  }
}
