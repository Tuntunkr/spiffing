import type { SchemaTypeDefinition } from "sanity";
import { post } from "./schemas/post";
import { designer } from "./schemas/designer";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, designer],
};
