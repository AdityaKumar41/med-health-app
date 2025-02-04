import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL!);
  const { name, email, age, gender, wallet_address } = await request.json();
  try {
    if (!name || !email || !gender || !age) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result =
      await sql`INSERT INTO patient (name, email, age, gender, profile_image) VALUES (${name}, ${email}, ${age}, ${gender}, ${wallet_address})`;

    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: error }, { status: 500 });
  }
};

export async function GET(request: Request) {
  const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL!);
  try {
    const result = await sql`SELECT * FROM patient`;
    return Response.json({ data: result }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: error }, { status: 500 });
  }
}
