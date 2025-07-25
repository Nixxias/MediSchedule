import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useNavigation } from "./lib/navigation";
import { useEffect } from "react";


import Header from "@/components/Header";
import Footer from "@/components/Footer";


import Home from "@/pages/Home";
import AppointmentBooking from "@/pages/AppointmentBooking";
import DoctorLogin from "@/pages/DoctorLogin";
import DoctorDashboard from "@/pages/DoctorDashboard";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [location] = useLocation();
  const { setPage } = useNavigation();

  useEffect(() => {
    if (location === "/") {
      setPage("home");
    } else if (location === "/appointment") {
      setPage("appointment");
    } else if (location === "/login") {
      setPage("login");
    } else if (location === "/dashboard") {
      setPage("dashboard");
    }
  }, [location, setPage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/appointment" component={AppointmentBooking} />
          <Route path="/login" component={DoctorLogin} />
          <Route path="/dashboard" component={DoctorDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
