export default function Header() {
  return (
    <header className="h-14 bg-white shadow flex items-center justify-between px-4">
      <h1 className="font-semibold">Alesteb</h1>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="text-red-500 text-sm"
      >
        Salir
      </button>
    </header>
  );
}
