import React, { useEffect, useState } from "react";

export default function GreetingsBar({ username }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();

      if (currentHour < 12) setGreeting("Good morning");
      else if (currentHour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // update every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#b30000",
        color: "white",
        padding: "10px 20px",
        fontWeight: "500",
        fontSize: "16px",
        borderRadius: "8px",
        marginBottom: "20px",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
      }}
    >
      {greeting}
      {username ? `, ${username}!` : "!"}
    </div>
  );
}
