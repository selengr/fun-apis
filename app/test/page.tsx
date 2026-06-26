




const page = async () => {

    // این کار میکنه — مستقیم از client
    const res = await fetch('https://tradestie.com/api/v1/apps/reddit')
    const data = await res?.json()
    console.log("d-------", data) // لیست سهام با sentiment


    return (
        <div>
            Enter
        </div>
    );
}

export default page;