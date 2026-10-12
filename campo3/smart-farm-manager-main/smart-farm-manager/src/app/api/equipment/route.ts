import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Equipment from "@/models/Equipment";

/* =========================
   GET — all equipment
========================= */
export async function GET() {
  try {
    await connectToDatabase();
    const equipment = await Equipment.find().populate("farmer_id"); // join with Farmer info
    return NextResponse.json(equipment, { status: 200 });
  } catch (error) {
    console.error("GET /equipment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

/* =========================
   GET — one equipment by ID
========================= */
export async function GET_BY_ID(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Missing equipment id" },
        { status: 400 }
      );

    const equipment = await Equipment.findById(id).populate("farmer_id");
    if (!equipment)
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );

    return NextResponse.json(equipment, { status: 200 });
  } catch (error) {
    console.error("GET /equipment/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — create equipment
========================= */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newEquipment = await Equipment.create(body);
    return NextResponse.json(newEquipment, { status: 201 });
  } catch (error) {
    console.error("POST /equipment error:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT — update equipment
========================= */
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedEquipment = await Equipment.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("farmer_id");

    if (!updatedEquipment)
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );

    return NextResponse.json(updatedEquipment, { status: 200 });
  } catch (error) {
    console.error("PUT /equipment error:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — delete equipment
========================= */
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Missing equipment id" },
        { status: 400 }
      );

    await Equipment.findByIdAndDelete(id);
    return NextResponse.json({ message: "Equipment deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /equipment error:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
