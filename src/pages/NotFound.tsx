import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="text-muted-foreground">This page could not be found.</p>
        <Link to="/" className="text-primary underline underline-offset-4">
          Back home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
