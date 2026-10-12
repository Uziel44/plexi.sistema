import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Field from "@/models/Field";

//  GET — all fields

export async function GET() {
  try {
    await connectToDatabase();
    const fields = await Field.find().populate("farmer_id");
    return NextResponse.json(fields, { status: 200 });
  } catch (error) {
    console.error("GET /fields error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fields" },
      { status: 500 }
    );
  }
}

//  GET — one field by ID

export async function GET_BY_ID(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing field id" }, { status: 400 });

    const field = await Field.findById(id).populate("farmer_id");
    if (!field)
      return NextResponse.json({ error: "Field not found" }, { status: 404 });

    return NextResponse.json(field, { status: 200 });
  } catch (error) {
    console.error("GET /fields/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch field" },
      { status: 500 }
    );
  }
}

//   POST — create field

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newField = await Field.create(body);
    return NextResponse.json(newField, { status: 201 });
  } catch (error) {
    console.error("POST /fields error:", error);
    return NextResponse.json(
      { error: "Failed to create field" },
      { status: 500 }
    );
  }
}

// PUT — update field

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedField = await Field.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("farmer_id");

    if (!updatedField)
      return NextResponse.json({ error: "Field not found" }, { status: 404 });

    return NextResponse.json(updatedField, { status: 200 });
  } catch (error) {
    console.error("PUT /fields error:", error);
    return NextResponse.json(
      { error: "Failed to update field" },
      { status: 500 }
    );
  }
}

//  DELETE — delete field

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing field id" }, { status: 400 });

    await Field.findByIdAndDelete(id);
    return NextResponse.json({ message: "Field deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /fields error:", error);
    return NextResponse.json(
      { error: "Failed to delete field" },
      { status: 500 }
    );
  }
}
