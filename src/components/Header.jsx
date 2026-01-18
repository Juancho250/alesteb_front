export default function Header() {
  return (
    <header className="h-14 bg-white shadow flex items-center justify-between px-4">
      <h1 className="font-semibold">ALESTEB</h1>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
        className="text-red-500 text-sm"
      >
        Salir
      </button>
    </header>
  );
}
