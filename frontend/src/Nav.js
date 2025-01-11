import Button from 'components/Button';
import {
    AnimatePresence,
    motion,
    useMotionValueEvent,
    useScroll,
} from "framer-motion";
import { checkLoginStatus, handleSignOut } from 'Login/functions';
import { useEffect, useState } from 'react';
import { HiBars3, HiXMark } from "react-icons/hi2";
import { Link } from 'react-router-dom';
import { cn } from "utils/cn";

import "css/Nav.css";

const navigation = [
    { name: "Home", href: "/", current: true },
    { name: "Features", href: "#", current: false },
    { name: "Pricing", href: "#", current: false },
];

const links = [
    { name: "GitHub", href: "https://github.com/Hayden9898/Syllabus-Scanner" },
    { name: "LinkedIn", href: "#" },
];

export default function Nav() {
    const [loggedIn, setLoggedIn] = useState(false);
    const { scrollYProgress } = useScroll();
    const [open, setOpen] = useState(false);
    const [mobile, setMobile] = useState(null);
    const [visible, setVisible] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const updateMobile = () => setMobile(window.innerWidth < 768);
        updateMobile();
        window.addEventListener("resize", updateMobile);

        if (window.innerWidth >= 768) {
            const handleScroll = () => {
                if (window.scrollY > 50) {
                    setHasScrolled(true);
                }
            };
            window.addEventListener("scroll", handleScroll);
            return () => {
                window.removeEventListener("scroll", handleScroll);
                window.removeEventListener("resize", updateMobile);
            };
        }

        return () => {
            window.removeEventListener("resize", updateMobile);
        };
    }, []);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        if (typeof current === "number") {
            let direction = current - scrollYProgress.getPrevious();

            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else if (direction > 0 && hasScrolled) {
                    setVisible(false);
                }
            }
        }
    });

    useEffect(() => {
        const fetchLoginStatus = async () => {
            try {
                const loggedIn = await checkLoginStatus();
                setLoggedIn(loggedIn.authenticated);
            } catch (error) {
                console.error("Failed to check login status:", error);
            }
        };

        fetchLoginStatus();
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.nav
                initial={{
                    opacity: 1,
                    y: 0,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    `z-[10] fixed text-center justify-center flex flex-col md:grid grid-cols-3 items-center w-full md:h-[5em] px-8 md:py-3 bg-black md:text-sm text-2xl transition-all duration-300 ease-in-out ${open ? "h-full" : mobile && "h-[13%] items-start"
                    }`
                )}
            >
                {mobile && (
                    <>
                        {open ? (
                            <HiXMark
                                className="size-14 absolute left-[10%] active:rotate-180 transition-all ease-in-out"
                                onClick={() => { setOpen(false) }}
                            />
                        ) : (
                            <AnimatePresence>
                                <motion.div
                                    initial={{ y: 0 }}
                                    animate={{ y: open ? 100 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <HiBars3
                                        className="size-10 left-[10%]"
                                        onClick={() => setOpen(true)}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </>
                )}
                {(open || !mobile) && (
                    <>
                        <Link
                            href="/"
                            className="name justify-self-start invisible md:visible"
                        >
                            SyllaScan
                        </Link>
                        <ul
                            className={cn(
                                "nav-links flex md:flex-row flex-col items-center md:justify-self-center md:space-x-4",
                                { show: isMounted }
                            )}
                        >
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={"link"}
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ul
                            className={cn(
                                "nav-links flex md:flex-row flex-col items-center md:justify-self-end md:space-x-4 pt-4 md:pt-0",
                                { show: isMounted }
                            )}
                        >
                            {links.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        target="_blank"
                                        className="link"
                                        onClick={() => setOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                            {loggedIn &&
                                <li>
                                    <Button className="shadow-none" onClick={handleSignOut}>Signout</Button>
                                </li>
                            }
                        </ul>
                    </>
                )}
            </motion.nav>
        </AnimatePresence>
    );
};