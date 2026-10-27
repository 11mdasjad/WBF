// Original, lightweight line drawings inspired by the cities' landmark silhouettes.
export function CityLandmark({ city }: { city: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 72h84" />
      {city === "Pune" ? (
        <>
          <path fill="currentColor" fillOpacity=".08" d="M17 72V35h66v37H17Z" />
          <path d="M14 35h72M20 35V24h60v11M27 24v-7h46v7M34 17v-6h32v6M22 72V40m7 32V40m42 32V40m7 32V40M41 72V54a9 9 0 0 1 18 0v18M36 35v37m28-37v37M34 24h32M39 17h22" />
        </>
      ) : city === "Jaipur" ? (
        <>
          <path
            fill="currentColor"
            fillOpacity=".08"
            d="M16 72V37h12V26h13V15h18v11h13v11h12v35H16Z"
          />
          <path d="M16 72V37h12V26h13V15h18v11h13v11h12v35M13 72h74M16 58h68M16 45h68M28 33h44M41 22h18M46 15l4-7 4 7" />
          {[24, 37, 50, 63, 76].map((x) => (
            <path
              key={x}
              d={`M${x - 3} 68v-5a3 3 0 0 1 6 0v5m-6-13v-4a3 3 0 0 1 6 0v4`}
            />
          ))}
          {[36, 50, 64].map((x) => (
            <path key={x} d={`M${x - 3} 42v-4a3 3 0 0 1 6 0v4`} />
          ))}
        </>
      ) : city === "Hyderabad" ? (
        <>
          <path
            fill="currentColor"
            fillOpacity=".08"
            d="M19 72V31h10v9h42v-9h10v41H19Z"
          />
          <path d="M19 72V31h10v41m42 0V31h10v41M17 31h14M69 31h14M20 27V14h8v13m44 0V14h8v13M18 14l6-8 6 8m40 0 6-8 6 8M24 6V2m52 4V2M29 40h42M29 50h42M39 72V59q11-16 22 0v13M21 22h6m46 0h6M36 40v-7m14 7v-9m14 9v-7" />
        </>
      ) : city === "Mumbai" ? (
        <>
          <path fill="currentColor" fillOpacity=".08" d="M18 72V35h64v37H18Z" />
          <path d="M15 35h70M19 35V25h12v10m38 0V25h12v10M25 25v-8m50 8v-8M31 32V21h38v11M36 21l14-8 14 8M50 13V8M18 43h64M29 72V43m42 0v29M39 72V55q11-17 22 0v17M21 63h5m48 0h5M35 32h30" />
        </>
      ) : (
        <>
          <path fill="currentColor" fillOpacity=".08" d="M25 72V30h50v42H25Z" />
          <path d="M22 72V65h8V39h-8v-9h56v9h-8v26h8v7M28 30V20h44v10M32 20v-7h36v7M40 13V8h20v5M30 39h40M39 72V53a11 11 0 0 1 22 0v19M26 25h48M36 34h28M29 65h10m22 0h10M44 18h12" />
        </>
      )}
    </svg>
  );
}
