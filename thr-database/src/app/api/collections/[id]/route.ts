import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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
        WHERE id = $1;
        `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          error: "Collection not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Collection database error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve collection.",
      },
      {
        status: 500,
      },
    );
  }
}
