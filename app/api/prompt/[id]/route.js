import Prompt from "@models/prompt";
import { connectToDB } from "@utils/database";

export const GET = async (request, { params }) => {
  try {
    await connectToDB();

    const prompt = await Prompt.findById(params.id).populate("creator");
    if (!prompt) return new Response("Prompt Not Found", { status: 404 });

    return new Response(JSON.stringify(prompt), { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const PATCH = async (request, { params }) => {
  const { prompt, tag } = await request.json();

  try {
    await connectToDB();

    // Find the existing prompt by ID
    const existingPrompt = await Prompt.findById(params.id);

    if (!existingPrompt) {
      return new Response("Prompt not found", { status: 404 });
    }

    // Update the prompt with new data
    existingPrompt.prompt = prompt;
    existingPrompt.tag = tag;

    await existingPrompt.save();

    return new Response("Successfully updated the Prompts", { status: 200 });
  } catch (error) {
    return new Response("Error Updating Prompt", { status: 500 });
  }
};

export const DELETE = async (request, { params }) => {
  try {
    await connectToDB();
    console.log(`Attempting to delete prompt with ID: ${params.id}`); // Log ID being deleted

    // Option 1: Use deleteOne
    const result = await Prompt.deleteOne({ _id: params.id });

    if (result.deletedCount === 0) {
      console.error(`Prompt with ID ${params.id} not found.`);
      return new Response("Prompt not found", { status: 404 });
    }

    console.log(`Prompt with ID ${params.id} deleted successfully.`);
    return new Response("Prompt deleted successfully", { status: 200 });

    // Option 2: Use findByIdAndDelete
    // const deletedPrompt = await Prompt.findByIdAndDelete(params.id);
    // if (!deletedPrompt) {
    //   console.error(`Prompt with ID ${params.id} not found.`);
    //   return new Response("Prompt not found", { status: 404 });
    // }
    // console.log(`Prompt with ID ${params.id} deleted successfully.`);
    // return new Response("Prompt deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    return new Response("Error deleting prompt", { status: 500 });
  }
};
