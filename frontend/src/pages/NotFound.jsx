import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
            <Card className="max-w-md text-center shadow-2xl">
                <CardContent className="p-8">
                    <h1 className="text-6xl font-bold text-red-500">404</h1>
                    <p className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Page Not Found
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                    <Button
                        className="mt-6"
                        onClick={() => navigate("/dashboard")}
                        variant="outline"
                    >
                        Go to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotFound;
