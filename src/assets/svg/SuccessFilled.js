function SvgSuccessFilled(props) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask
        id="success-filled_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={24}
        height={24}
      >
        <path fill="#C4C4C4" d="M0 0h24v24H0z" />
      </mask>
      <g mask="url(#success-filled_svg__a)">
        <mask
          id="success-filled_svg__b"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={24}
          height={24}
        >
          <circle cx={12} cy={12} r={12} fill="#C4C4C4" />
        </mask>
        <g mask="url(#success-filled_svg__b)">
          <circle cx={12} cy={12} r={10} fill="#44D7B6" />
          <path
            d="M15.5 8.5L11.432 14 9 12.125"
            stroke="#fff"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </svg>
  )
}

export default SvgSuccessFilled
