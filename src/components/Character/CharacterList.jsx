export default function CharacterList({ characters, onRemove }) {
  return (
    <ul className="my-2">
      {characters.map((c) => (
        <li key={c.id} className="flex justify-between items-center border-b py-1">
          <span>{c.name}</span>
          <button
            onClick={() => onRemove(c.id)}
            className="text-red-500 hover:text-red-700 text-xs"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
