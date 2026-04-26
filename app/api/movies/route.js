// app/api/movies/route.js
import { NextResponse } from "next/server";
import { getClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB = "moviepalace";
const COL = "movies";

// GET /api/movies?type=movie|series&genre=Action&search=batman&limit=20&page=1
export async function GET(req) {
  try {
    const client = await getClient();
    const db = client.db(DB);
    const params = req.nextUrl.searchParams;

    const type = params.get("type");
    const genre = params.get("genre");
    const search = params.get("search");
    const limit = parseInt(params.get("limit") || "50");
    const page = parseInt(params.get("page") || "1");
    const id = params.get("id");

    // Single movie fetch
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      }
      const movie = await db.collection(COL).findOne({ _id: new ObjectId(id) });
      if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(movie);
    }

    // Build query
    const query = {};
    if (type) query.type = type;
    if (genre) query.genre = { $regex: genre, $options: "i" };
    if (search) query.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const total = await db.collection(COL).countDocuments(query);

    const movies = await db
      .collection(COL)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      movies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

// POST /api/movies — Add new movie/series
export async function POST(req) {
  try {
    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db(DB);

    const doc = {
      title: body.title.trim(),
      poster: body.poster?.trim() || "",
      banner: body.banner?.trim() || "",
      year: body.year || "",
      genre: body.genre || "",
      language: body.language || "English",
      rating: body.rating || "",
      cast: body.cast || "",
      description: body.description?.trim() || "",
      trailer: body.trailer || "",
      downlink: body.downlink || "",
      watch: body.watch || "",
      type: body.type || "movie",
      seasons: body.type === "series" ? (body.seasons || []) : [],
      featured: body.featured || false,
      tags: body.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection(COL).insertOne(doc);
    return NextResponse.json({ message: "Added successfully", id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("POST error:", err);
    return NextResponse.json({ error: "Add failed" }, { status: 500 });
  }
}

// PATCH /api/movies — Update existing movie
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID required" }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db(DB);

    updates.updatedAt = new Date();

    const result = await db.collection(COL).updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE /api/movies?id=xxx
export async function DELETE(req) {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid ID required" }, { status: 400 });
    }

    const client = await getClient();
    const db = client.db(DB);

    const result = await db.collection(COL).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
