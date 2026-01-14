import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";

export const tagGroupController = new Elysia({ prefix: "/tag-group" })
  .get("/all", async () => {
    const tagGroups = await prisma.tagGroup.findMany();
    return { tagGroups };
  })
  .post(
    "/new",
    async ({ body, status }) => {
      const { name } = body;

      const existingTagGroup = await prisma.tagGroup.findFirst({
        where: { name },
      });

      if (existingTagGroup) {
        return status(400, "Tag group with this name already exists");
      }

      const newTagGroup = await prisma.tagGroup.create({
        data: { name },
      });

      status(201);
      return newTagGroup;
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, status }) => {
      const tagGroupId = parseInt(id);

      const existingTagGroup = await prisma.tagGroup.findUnique({
        where: { id: tagGroupId },
      });

      if (!existingTagGroup) {
        return status(404, "Tag group not found");
      }

      await prisma.tagGroup.delete({
        where: { id: tagGroupId },
      });

      status(204);
      return existingTagGroup;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
