import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Header() {

    return(
        <header className="border-b">
            <div className="container mx-auto flex items-center justify-between px-4 py-6">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold">
                            <img className="logo" src="/img/ttc_type3.png" alt="ttc" />
                        </Link>
                        <p>練習会スケジュール</p>
                </div>
                {/* <form className="mx-4 max-w-sm flex-1">
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input type="text" placeholder="キーワードを入力..." />
                    <Button type="submit">検索</Button>
                </div>
                </form> */}
            </div>
        </header>
    )

}