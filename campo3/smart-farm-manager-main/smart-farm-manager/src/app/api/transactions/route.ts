import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Transaction from "@/models/Transaction";

/* =========================
   GET — all transactions
========================= */
export async function GET() {
  try {
    await connectToDatabase();
    const transactions = await Transaction.find()
      .populate("farmer_id")
      .populate("equipment_id");
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error("GET /transactions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

/* =========================
   GET — one transaction by ID
========================= */
export async function GET_BY_ID(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Missing transaction id" },
        { status: 400 }
      );

    const transaction = await Transaction.findById(id)
      .populate("farmer_id")
      .populate("equipment_id");

    if (!transaction)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );

    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    console.error("GET /transactions/:id error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

/* =========================
   POST — create transaction
========================= */
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newTransaction = await Transaction.create(body);
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("POST /transactions error:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}

/* =========================
   PUT — update transaction
========================= */
export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { id, ...updateData } = body;

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    )
      .populate("farmer_id")
      .populate("equipment_id");

    if (!updatedTransaction)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    console.error("PUT /transactions error:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE — delete transaction
========================= */
export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json(
        { error: "Missing transaction id" },
        { status: 400 }
      );

    await Transaction.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Transaction deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /transactions error:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}
