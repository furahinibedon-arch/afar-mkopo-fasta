
module.exports = async (req, res) => {
  try {
    console.log("Test endpoint hit");
    console.log("Environment variables present:", !!process.env.DATABASE_URL, !!process.env.JWT_SECRET);
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log("Prisma connected successfully");
    
    res.json({ 
      status: "ok", 
      message: "API is working!", 
      dbConnected: true 
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message, 
      stack: error.stack 
    });
  }
};
