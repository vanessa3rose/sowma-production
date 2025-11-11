// import logo from "../images/logo.png";


const Topbanner = () => {
    return (
     <div className="fixed top-0 left-0 right-0 z-50">
        <div className="w-full h-28 bg-sowma-gray rounded-b-3xl px-10 ml-[298px] relative">
          <div className="absolute left-[65px] top-[32px] w-[656px] h-[50px] bg-white rounded-3xl"></div>
          <p className="absolute right-16 top-[45px]">Last Refreshed: XX/XX/XXXX XX:XX AM</p>
          <div className="absolute right-4 top-[42px]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </div>
        </div>
     </div> 
    );
}
export default Topbanner;