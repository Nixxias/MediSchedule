import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import { appointmentFormSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      fullName: string;
      specialty?: string;
    };
  }
}

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "doctor-appointment-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, 
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 h
        secure: process.env.NODE_ENV === "production" ? true : false,
      },
    })
  );

  
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (req.session.user) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized: Please log in" });
    }
  };

  // API routes
  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      
      req.session.user = {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        specialty: user.specialty === null ? undefined : user.specialty
      };

      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        specialty: user.specialty
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

 
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  
  app.get("/api/auth/status", (req, res) => {
    if (req.session.user) {
      res.json({ isAuthenticated: true, user: req.session.user });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

 
  app.get("/api/doctors", async (req, res) => {
    try {
      
      const users = await Promise.all([
        storage.getUserByUsername("dr-smith"),
        storage.getUserByUsername("dr-johnson"),
        storage.getUserByUsername("dr-williams")
      ]);
      
      
      const doctors = users
        .filter(user => user !== undefined)
        .map(user => ({
          id: user!.id,
          username: user!.username,
          fullName: user!.fullName,
          specialty: user!.specialty
        }));
        
      res.json(doctors);
    } catch (error) {
      console.error("Get doctors error:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = appointmentFormSchema.parse(req.body);
      const newAppointment = await storage.createAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Create appointment error:", error);
        res.status(500).json({ message: "Failed to create appointment" });
      }
    }
  });

 
  app.get("/api/appointments", requireAuth, async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  
  app.get("/api/appointments/doctor/:doctorId", requireAuth, async (req, res) => {
    try {
      const { doctorId } = req.params;
      
      if (req.session.user && req.session.user.username !== doctorId) {
        return res.status(403).json({ message: "You can only view your own appointments" });
      }
      
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      console.log(`Fetched ${appointments.length} appointments for doctor ${doctorId}`);
      res.json(appointments);
    } catch (error) {
      console.error("Get doctor appointments error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });
  
  app.get("/api/my-appointments", requireAuth, async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
      }
      
      const doctorId = req.session.user.username;
      const appointments = await storage.getAppointmentsByDoctor(doctorId);
      console.log(`Fetched ${appointments.length} appointments for logged-in doctor ${doctorId}`);
      res.json(appointments);
    } catch (error) {
      console.error("Get doctor appointments error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/date/:date", requireAuth, async (req, res) => {
    try {
      const { date } = req.params;
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments by date error:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !["confirmed", "completed", "cancelled", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedAppointment = await storage.updateAppointmentStatus(Number(id), status);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Update appointment status error:", error);
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storage.deleteAppointment(Number(id));

    if (!deleted) {
      return res.status(404).json({ message: "Wizyta nie znaleziona" });
    }

    res.json({ message: "Wizyta usunięta" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({ message: "Nie udało się usunąć wizyty" });
  }
});

  const httpServer = createServer(app);
  return httpServer;
}
