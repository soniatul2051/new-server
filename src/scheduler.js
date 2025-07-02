import { Article } from './Models/ArticleSchema.js';

const startArticleScheduler = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      
      // Find and update articles that should be published
      const result = await Article.updateMany(
        { 
          $or: [
            { 
              status: 'scheduled',
              publishAt: { $lte: now }
            },
            {
              status: { $ne: 'online' },
              publishAt: { $lte: now }
            }
          ]
        },
        { 
          $set: { 
            status: 'online',
            lastPublishedAt: now 
          } 
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`Published ${result.modifiedCount} scheduled articles at ${now}`);
      }
    } catch (error) {
      console.error('Error in article scheduler:', error);
    }
  }, 60000); // Run every minute
};

export default startArticleScheduler;