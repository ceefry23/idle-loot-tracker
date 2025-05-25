export default function CharacterDropdown({ characters, value, onChange }) {
  return (
    <select
      className="border border-yellow-500 bg-gray-900 text-yellow-200 placeholder-yellow-600
        rounded-xl px-4 py-2 focus:ring-2 focus:ring-yellow-400 outline-none transition-all"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select character...
      </option>
      {characters.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
