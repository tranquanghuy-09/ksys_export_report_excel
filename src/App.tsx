import Spreadsheet from "./Spreadsheet";
import "./App.css";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function App() {
  const [visits, setVisits] = useState(null);

  useEffect(() => {
    // Fetch initial visit count
    fetch('https://6509669ef6553137159b5c22.mockapi.io/api/v1/huy/1')
      .then(res => res.json())
      .then(data => {
        setVisits(data.visits);
        // Update visit count
        fetch('https://6509669ef6553137159b5c22.mockapi.io/api/v1/huy/1', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            visits: data.visits + 1,
            lastVisited: new Date().toISOString()
          })
        });
      });
  }, []);

  return (
    <motion.div
      className="App w-screen h-screen overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="flex-grow"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Spreadsheet />
      </motion.div>
      <motion.div
        className="text-center p-4 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p>Số lượt truy cập: {visits}</p>
        <p>&copy; {new Date().getFullYear()} All rights reserved</p>
      </motion.div>
    </motion.div>
  );
}

export default App;