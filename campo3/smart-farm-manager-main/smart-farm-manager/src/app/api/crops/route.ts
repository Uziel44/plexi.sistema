import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Crop from "@/models/Crop";

/* =========================
   GET — all crops
========================= */
export async function GET() {
  try {
    await connectToDatabase();
    const crops = await Crop.find().populate("field_id"); // join with Field info
    return NextResponse.json(crops, { status: 200 });
  } catch (error) {
    console.error("GET /crops error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crops" },
      { status: 500 }
    );
  }
}

/* =========================
   GET — one crop by ID
========================= */
export async function GET_BY_ID(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing crop id" }, { status: 400 });

    const crop = await Crop.findById(id).populate("field_id");
    if (!crop)
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });

    return NextResponse.json(crop, { status: 200 });
  } catch (error) {
    console.error("GET /crops/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch crop" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — create crop
========================= */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newCrop = await Crop.create(body);
    return NextResponse.json(newCrop, { status: 201 });
  } catch (error) {
    console.error("POST /crops error:", error);
    return NextResponse.json(
      { error: "Failed to create crop" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT — update crop
========================= */
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedCrop = await Crop.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("field_id");

    if (!updatedCrop)
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });

    return NextResponse.json(updatedCrop, { status: 200 });
  } catch (error) {
    console.error("PUT /crops error:", error);
    return NextResponse.json(
      { error: "Failed to update crop" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — delete crop
========================= */
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing crop id" }, { status: 400 });

    await Crop.findByIdAndDelete(id);
    return NextResponse.json({ message: "Crop deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /crops error:", error);
    return NextResponse.json(
      { error: "Failed to delete crop" },
      { status: 500 }
    );
  }
}
