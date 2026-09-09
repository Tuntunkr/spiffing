import { describe, expect, it } from "vitest";
import {
  breadcrumbSchema,
  collectionSchema,
  creativeWorkSchema,
  graph,
  howToSchema,
  organizationSchema,
  websiteSchema,
} from "@/lib/schema";
import { SEED_POSTS } from "@/lib/seed";

describe("JSON-LD builders", () => {
  it("emits WebSite and Organization with required fields", () => {
    const site = websiteSchema();
    const org = organizationSchema();
    expect(site["@type"]).toBe("WebSite");
    expect(site.name).toBe("Spiffing");
    expect(typeof site.url).toBe("string");
    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("Spiffing");
  });

  it("wraps a graph with schema.org context", () => {
    const doc = graph([organizationSchema(), websiteSchema()]);
    expect(doc["@context"]).toBe("https://schema.org");
    expect(Array.isArray(doc["@graph"])).toBe(true);
  });

  it("marks a piece as CreativeWork, never Product", () => {
    const work = creativeWorkSchema(SEED_POSTS[0]);
    expect(work["@type"]).toBe("CreativeWork");
    expect(JSON.stringify(work)).not.toContain("Product");
    expect(JSON.stringify(work)).not.toContain("aggregateRating");
    expect((work.image as { "@type": string })["@type"]).toBe("ImageObject");
  });

  it("builds breadcrumbs and collection lists", () => {
    const crumbs = breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Web", path: "/web" },
    ]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    const collection = collectionSchema({
      name: "Web",
      description: "Web design",
      path: "/web",
      posts: SEED_POSTS.filter((p) => p.category === "Web"),
    });
    expect(collection["@type"]).toBe("CollectionPage");
    expect((collection.mainEntity as { "@type": string })["@type"]).toBe("ItemList");
  });

  it("describes how-to-use as HowTo with four browse steps", () => {
    const how = howToSchema();
    expect(how["@type"]).toBe("HowTo");
    expect((how.step as unknown[]).length).toBe(4);
  });
});
