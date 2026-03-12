-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "due_date" TIMESTAMP(3),
ADD COLUMN     "pic_id" TEXT;

-- CreateIndex
CREATE INDEX "projects_pic_id_idx" ON "projects"("pic_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
