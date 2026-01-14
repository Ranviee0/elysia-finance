import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";

export const tagController = new Elysia({ prefix: "/tag" })
  .get("/all", async () => {
    const tags = await prisma.tag.findMany();
    return { tags };
  })
  .post(
    "/new",
    async ({ body, status }) => {
      const { name, groupId } = body;

      const existingTag = await prisma.tag.findFirst({
        where: { name },
      });

      if (existingTag) {
        return status(400, "Tag with this name already exists");
      }

      if (groupId !== undefined) {
        const groupExists = await prisma.tagGroup.findUnique({
          where: { id: groupId },
        });

        if (!groupExists) {
          return status(400, "Tag group not found");
        }
      }

      const newTag = await prisma.tag.create({
        data: { name, groupId },
      });

      status(201);
      return newTag;
    },
    {
      body: t.Object({
        name: t.String(),
        groupId: t.Optional(t.Number()),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params: { id }, status }) => {
      const tagId = parseInt(id);

      const existingTag = await prisma.tag.findUnique({
        where: { id: tagId },
      });

      if (!existingTag) {
        return status(404, "Tag not found");
      }

      await prisma.tag.delete({
        where: { id: tagId },
      });

      return status(204);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
