import React from "react";

export default function GuideModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[65vh] relative text-yellow-200 text-center overflow-y-auto">
                <button
                    className="absolute top-3 right-4 text-3xl text-yellow-400 font-bold hover:text-yellow-300"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="text-2xl font-bold mb-6 text-yellow-400">
                    IdleMMO Loot Tracker — Quick Guide
                </h2>

                <ol className="space-y-8 text-left text-base list-decimal list-inside px-2">
                    <li>
                        <b className="text-yellow-300">Create a Character</b>
                        <div className="ml-5 mt-2 space-y-2">
                            <div>• Click <b>“Add Character”</b> at the top.</div>
                            <div>• Type your character’s name and click <b>“Save”</b>.</div>
                            <div>• Add more characters if you want.</div>
                        </div>
                    </li>

                    <li>
                        <b className="text-yellow-300">Log Dungeon or Boss Runs</b>
                        <div className="ml-5 mt-2 space-y-2">
                            <div>• Go to the <b>“Log Dungeon Run”</b> or <b>“Log Boss Kill”</b> section.</div>
                            <div>• Select your character from the list.</div>
                            <div>• Enter the dungeon or boss name and any loot drops.</div>
                            <div>• Click <b>“Add Dungeon Run”</b> or <b>“Add Boss Run”</b> to save your run.</div>
                        </div>
                    </li>

                    <li>
                        <b className="text-yellow-300">See Your Runs</b>
                        <div className="ml-5 mt-2 space-y-2">
                            <div>• Your past runs are listed by date.</div>
                            <div>• Use filters at the top to sort by character, dungeon, boss, loot, or rarity.</div>
                            <div>• You can also enter your item profits for better stats.</div>
                        </div>
                    </li>

                    <li>
                        <b className="text-yellow-300">Use Filters</b>
                        <div className="ml-5 mt-2 space-y-2">
                            <div>• Click <b>“Filters”</b> to show only runs you want to see.</div>
                            <div>• Filter by character, dungeon, boss, loot type, or rarity.</div>
                        </div>
                    </li>

                    <li>
                        <b className="text-yellow-300">Check Your Stats</b>
                        <div className="ml-5 mt-2 space-y-2">
                            <div>• View totals for runs, drops, profit, and more on the Analytics page.</div>
                            <div>• See your streaks, longest dry runs, and more advanced analytics.</div>
                        </div>
                    </li>

                    <li>
                        <b className="text-yellow-300">Login or Continue as Guest</b>
                        <div className="ml-5 mt-2 space-y-2">
                            <div>• You can make a free account, or use the tracker as a guest.</div>
                            <div>• Runs are saved to your device and the cloud (if logged in).</div>
                        </div>
                    </li>
                </ol>

                <div className="mt-8 text-yellow-400 text-sm font-semibold">
                    <div>
                        <span className="block mb-1">New webapp – feedback and suggestions are welcome!</span>
                        <span>Questions? Contact the developer on Discord:&nbsp;
                            <a
                                href="https://discordapp.com/users/378638009421266947"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                            >
                                ceefry23
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
