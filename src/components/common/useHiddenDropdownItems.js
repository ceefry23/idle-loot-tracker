import { useState, useEffect } from "react";

// Usage: const [hiddenItems, toggleHidden] = useHiddenDropdownItems("dungeon_hidden")
export function useHiddenDropdownItems(key) {
    const [hiddenItems, setHiddenItems] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(hiddenItems));
    }, [key, hiddenItems]);

    function toggleHidden(item) {
        setHiddenItems(list =>
            list.includes(item)
                ? list.filter(i => i !== item)
                : [...list, item]
        );
    }

    return [hiddenItems, toggleHidden];
}
