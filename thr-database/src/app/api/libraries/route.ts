import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        created_at,
        updated_at
      FROM libraries
      ORDER BY name;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve libraries.",
      },
      {
        status: 500,
      },
    );
  }
}
