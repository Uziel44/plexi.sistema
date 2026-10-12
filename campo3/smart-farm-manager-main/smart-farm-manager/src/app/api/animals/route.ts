import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Animal from "@/models/Animal";

/* =========================
   GET — all animals
========================= */
export async function GET() {
  try {
    await connectToDatabase();
    const animals = await Animal.find().populate("farmer_id"); // join farmer info
    return NextResponse.json(animals, { status: 200 });
  } catch (error) {
    console.error("GET /animals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch animals" },
      { status: 500 }
    );
  }
}

/* =========================
   GET — one animal by ID
========================= */
export async function GET_BY_ID(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing animal id" }, { status: 400 });

    const animal = await Animal.findById(id).populate("farmer_id");
    if (!animal)
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });

    return NextResponse.json(animal, { status: 200 });
  } catch (error) {
    console.error("GET /animals/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch animal" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — create animal
========================= */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newAnimal = await Animal.create(body);
    return NextResponse.json(newAnimal, { status: 201 });
  } catch (error) {
    console.error("POST /animals error:", error);
    return NextResponse.json(
      { error: "Failed to create animal" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT — update animal
========================= */
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedAnimal = await Animal.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("farmer_id");

    if (!updatedAnimal)
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });

    return NextResponse.json(updatedAnimal, { status: 200 });
  } catch (error) {
    console.error("PUT /animals error:", error);
    return NextResponse.json(
      { error: "Failed to update animal" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — delete animal
========================= */
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Missing animal id" }, { status: 400 });

    await Animal.findByIdAndDelete(id);
    return NextResponse.json({ message: "Animal deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /animals error:", error);
    return NextResponse.json(
      { error: "Failed to delete animal" },
      { status: 500 }
    );
  }
}
