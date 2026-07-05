
import Image from "next/image";
import styles from "./banner.module.css"



type Props = {
  data?: String,
  title?: String,
  banner: String,
  user: any
  home?: boolean
  videoReady?: boolean
}

const Banner = ({ data, title, banner, user, home, videoReady }: Props) => {


  return (
    <>
    <div className={styles["landing-main"]} style={{
      transform: videoReady ? "scale(1.05)" : "scale(0.85)",
      transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>

      <Image
        src={home ? (banner as string) : `/api/images/${banner}`}
        alt="Picture of the author"
        width={500}
        height={500}
        className={styles["landing-img"]}
      />


      {!home &&
        <Image
          src={`/api/images/${user?.image}`}
          alt="Picture of the author"
          width={100}
          height={100}
          className={styles["landing-div-rounded"]}
        />
      }
      {home &&
        <div className={`${styles["landing-div-rounded"]} bg-[#f7f6f3]`} >
          <Image
            // src={`${theme === "dark" ? "/LOGO/learning-logo-light.svg" : "/LOGO/learning-logo-dark.svg"}`}
            src={"/LOGO/rk-light-logo.png"}
            alt="Picture of the author"
            width={90}
            height={90}
            className={styles["landing-div-rounded-home"]}
          />
        </div>
      }

      <h1 className={styles["landing-title"]}>{title ? title : "rezakarbakhsh.ir"}</h1>

    </div>
       <div className="w-full h-full flex justify-center align-middle">
       <article className={styles['landing-article']}>
       <section className="w-full flex flex-col">

          <div className="flex flex-col">

                <span className="mb-5">Hello World👋</span>
                <span >I'm reza karbakhsh, a software developer who loves exploring AI by building and learning in public.</span>
              </div>

              <div>

                <span className={styles["landing-hover-highlight"]}>Stay tuned for exciting updates - coming soon! </span>
              </div>



              </section>

      
       </article>
  </div>

    </>
  );
}

export default Banner;