import Spreadsheet from "./Spreadsheet";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeContext";

const HomePage: React.FC = () => {
    const [visits, setVisits] = useState(null);
    const { actualTheme } = useTheme();

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
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.div
                className=""
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Spreadsheet />
            </motion.div>
            <motion.div
                className={`text-center pb-0 ${actualTheme === 'dark' ? 'text-gray-400 dark' : 'text-gray-600'}`}
                style={{
                    paddingBottom: '0px',
                    paddingTop: '0px'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <p style={{paddingTop: '0px', paddingBottom: '0px', marginTop: '12px', marginBottom: '6px'}}>Số lượt truy cập: {visits}</p>
                <p style={{paddingTop: '0px', paddingBottom: '0px', marginTop: '6px', marginBottom: '12px'}}>&copy; {new Date().getFullYear()} All rights reserved</p>
            </motion.div>
        </motion.div>
    );
};

export default HomePage; 