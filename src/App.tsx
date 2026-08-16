import Component1920WLight from "@/imports/1920WLight-1/index";
import Component1440WLight from "@/imports/1440WLight/index";
import Component768WLight from "@/imports/768WLight/index";

export default function App() {
  return (
    <>
      <div className="hidden xl:block">
        <Component1920WLight />
      </div>
      <div className="hidden md:block xl:hidden">
        <Component1440WLight />
      </div>
      <div className="block md:hidden">
        <Component768WLight />
      </div>
    </>
  );
}
