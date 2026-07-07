import Logo from "./Logo.js"
import Link from "next/link"
const NavBar = () => {
  return (
    <div className="flex justify-between items-center px-5 py-3">
      <Logo /> 
      <Link ref="/editor">Editor</Link>
    </div>
  )
}

export default NavBar
