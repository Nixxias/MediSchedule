import { users, type User, type InsertUser, appointments, type Appointment, type InsertAppointment } from "@shared/schema";
import fs from 'fs';
import path from 'path';


export interface IStorage {
 
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
 
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
}


const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');


if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}


if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([
    {
      id: 1,
      username: "dr-smith",
      password: "password123",
      fullName: "Dr. Smith",
      specialty: "General Physician"
    },
    {
      id: 2,
      username: "dr-johnson",
      password: "password123",
      fullName: "Dr. Johnson",
      specialty: "Pediatrician"
    },
    {
      id: 3,
      username: "dr-williams",
      password: "password123",
      fullName: "Dr. Williams",
      specialty: "Cardiologist"
    }
  ], null, 2));
}

if (!fs.existsSync(APPOINTMENTS_FILE)) {
  fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify([], null, 2));
}


export class FileStorage implements IStorage {
  deleteAppointments: any;
  
  async deleteAppointment(id: number): Promise<boolean> {
  const appointments = this.readAppointmentsFile();
  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) {
    return false;  
  }
  appointments.splice(index, 1);  
  this.writeAppointmentsFile(appointments);  
  return true;
}

  async getUser(id: number): Promise<User | undefined> {
    const users = this.readUsersFile();
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.readUsersFile();
    return users.find(user => user.username === username);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const users = this.readUsersFile();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    const newUser: User = {
      ...userData,
      specialty: userData.specialty ?? null,
      id: newId
    };
    
    users.push(newUser);
    this.writeUsersFile(users);
    
    return newUser;
  }

  
  async getAppointments(): Promise<Appointment[]> {
    return this.readAppointmentsFile();
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const appointments = this.readAppointmentsFile();
    return appointments.filter(appointment => appointment.doctorId === doctorId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const appointments = this.readAppointmentsFile();
    return appointments.filter(appointment => appointment.appointmentDate === date);
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const appointments = this.readAppointmentsFile();
    const newId = appointments.length > 0 ? Math.max(...appointments.map(a => a.id)) + 1 : 1;
    
    const newAppointment: Appointment = {
      ...appointmentData,
      id: newId,
      status: "confirmed",
      createdAt: new Date()
    };
    
    appointments.push(newAppointment);
    this.writeAppointmentsFile(appointments);
    
    return newAppointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointments = this.readAppointmentsFile();
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    
    if (appointmentIndex === -1) {
      return undefined;
    }
    
    appointments[appointmentIndex].status = status;
    this.writeAppointmentsFile(appointments);
    
    return appointments[appointmentIndex];
  }

  
  private readUsersFile(): User[] {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  }

  private writeUsersFile(users: User[]): void {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error writing users file:', error);
    }
  }

  private readAppointmentsFile(): Appointment[] {
    try {
      const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading appointments file:', error);
      return [];
    }
  }

  private writeAppointmentsFile(appointments: Appointment[]): void {
    try {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
    } catch (error) {
      console.error('Error writing appointments file:', error);
    }
  }
}


export class MemStorage implements IStorage {
  private usersList: User[] = [];
  private appointmentsList: Appointment[] = [];
  private userId = 1;
  private appointmentId = 1;

  constructor() {
   
    this.usersList = [
      {
        id: this.userId++,
        username: "dr-smith",
        password: "password123",
        fullName: "Dr. Smith",
        specialty: "General Physician"
      },
      {
        id: this.userId++,
        username: "dr-johnson",
        password: "password123",
        fullName: "Dr. Johnson",
        specialty: "Pediatrician"
      },
      {
        id: this.userId++,
        username: "dr-williams",
        password: "password123",
        fullName: "Dr. Williams",
        specialty: "Cardiologist"
      }
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.usersList.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.usersList.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = { ...user, id: this.userId++ };
    this.usersList.push(newUser);
    return newUser;
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.appointmentsList;
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentsList.filter(appointment => appointment.doctorId === doctorId);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return this.appointmentsList.filter(appointment => appointment.appointmentDate === date);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const newAppointment: Appointment = {
      ...appointment,
      reason: appointment.reason ?? null,
      id: this.appointmentId++,
      status: "confirmed",
      createdAt: new Date()
    };
    this.appointmentsList.push(newAppointment);
    return newAppointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointmentsList.find(a => a.id === id);
    if (appointment) {
      appointment.status = status;
    }
    return appointment;
  }
}


export const storage = new FileStorage();
