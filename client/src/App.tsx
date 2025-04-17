import { Switch, Route } from "wouter";
import React, { useState } from 'react';
import { 
  Home, 
  Plus, 
  Menu as MenuIcon
} from 'lucide-react';

// Import NotFound page
const NotFound = () => <div className="p-4"><h1 className="text-2xl font-bold">Page Not Found</h1></div>;

// Basic Button component since we can't use shadcn yet
const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  asChild = false,
  onClick,
  ...props 
}: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground"
  };
  
  const sizeClasses = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
    icon: "h-10 w-10"
  };
  
  const allClasses = `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses]} ${sizeClasses[size as keyof typeof sizeClasses]} ${className}`;
  
  if (asChild && children && typeof children === 'object') {
    const child = children as React.ReactElement;
    return React.cloneElement(child, {
      ...props,
      className: `${allClasses} ${child.props.className || ''}`,
      onClick: onClick || child.props.onClick,
    });
  }
  
  return (
    <button className={allClasses} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Basic cn utility
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

// Import pages
import { HomePage } from './pages/HomePage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { NewQuestionPage } from './pages/NewQuestionPage';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/question/:id" component={QuestionDetailPage} />
      <Route path="/new" component={NewQuestionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight gradient-heading">Discussion Forum</h1>
        </div>
        <Button asChild size="sm" className="gradient-button gap-1">
          <a href="/new">
            <Plus className="h-4 w-4" />
            <span>Ask Question</span>
          </a>
        </Button>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-background transition-transform md:translate-x-0 md:pt-16",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 pt-8 md:pt-4">
            <nav className="flex flex-col gap-2">
              <Button variant="ghost" asChild className="w-full justify-start gap-2">
                <a href="/">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </a>
              </Button>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={cn(
          "flex-1 transition-all",
          "md:ml-64",
          isSidebarOpen ? "ml-64" : "ml-0"
        )}>
          <div className="container px-4 py-6 md:px-6">
            <Router />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
