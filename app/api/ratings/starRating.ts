import { Router } from 'express';
import { prisma } from '@/components/StarRating/prismaClient'; // تأكد من المسار الصحيح

const router = Router();

router.post('/ratings', async (req, res) => {
  const { userId, courseId, rating } = req.body;

  try {
    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingRating) {
      // Update existing rating
      await prisma.rating.update({
        where: {
          id: existingRating.id,
        },
        data: {
          rating,
        },
      });
    } else {
      // Create new rating
      await prisma.rating.create({
        data: {
          userId,
          courseId,
          rating,
        },
      });
    }

    res.status(200).json({ message: 'Rating saved successfully' });
  } catch (error) {
    console.error(error); // طباعة الخطأ لتسهيل تتبعه
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

export default router;
