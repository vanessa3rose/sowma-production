const [isPressed, setIsPressed] = useState("")


<button
  className={`${isPressed === "first" ? "bg-blue-50" : "bg-white"}`}
  onClick={() => setIsPressed("first")}
>
  first
</button>

<button
  className=""
  onClick={() => setIsPressed("second")}
>
  second
</button>