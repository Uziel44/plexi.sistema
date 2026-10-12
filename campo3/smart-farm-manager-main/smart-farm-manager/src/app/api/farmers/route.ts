import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Farmer from "@/models/Farmer";

/*  GET — all farmers */
export async function GET() {
  try {
    await connectToDatabase();
    const farmers = await Farmer.find();
    return NextResponse.json(farmers, { status: 200 });
  } catch (error) {
    console.error("GET /farmers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch farmers" },
      { status: 500 }
    );
  }
}

/* POST — add farmer */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newFarmer = await Farmer.create(body);
    return NextResponse.json(newFarmer, { status: 201 });
  } catch (error) {
    console.error("POST /farmers error:", error);
    return NextResponse.json(
      { error: "Failed to create farmer" },
      { status: 500 }
    );
  }
}

/* PUT — update farmer */
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedFarmer = await Farmer.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedFarmer)
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });

    return NextResponse.json(updatedFarmer, { status: 200 });
  } catch (error) {
    console.error("PUT /farmers error:", error);
    return NextResponse.json(
      { error: "Failed to update farmer" },
      { status: 500 }
    );
  }
}

/* DELETE — delete farmer */
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await Farmer.findByIdAndDelete(id);
    return NextResponse.json({ message: "Farmer deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /farmers error:", error);
    return NextResponse.json(
      { error: "Failed to delete farmer" },
      { status: 500 }
    );
  }
}
