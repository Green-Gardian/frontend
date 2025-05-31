import { Outlet } from "react-router-dom"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const Applayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
          <div className="block md:hidden absolute">
            <SidebarTrigger />
          </div>
        <div className="flex flex-1 flex-col gap-4  bg-[#121212]">
          <Outlet className="rounded-3xl" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Applayout
