"use client"
import UploadArea from "../../components/editor/UploadArea.js"
import {useState} from "react"
const page = () => {
  const [isUpload, setIsUpload] = useState(false)
  return (
    <div className="w-full h-[100vh] flex items-center justify-center">
    { isUpload ? 
      <UploadArea />
  : <button onClick={() => setIsUpload((upload) => !upload)} className="flex items-center rounded-2xl bg-blue-500 text-white font-semibold px-4 py-2 hover:scale-110 transition">Upload</button>
    }
    </div>
  )}

export default page

