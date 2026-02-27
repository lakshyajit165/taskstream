import { isVideoUrl } from "../api/utils/formValidation";

export const markdownComponents = {
	img: ({ src, alt }) => (
		<img
			src={src}
			alt={alt}
			loading="lazy"
			style={{
				width: "100%",
				height: "auto",
				borderRadius: 8,
				margin: "12px 0",
				display: "block",
			}}
		/>
	),

	a: ({ href, children }) => {
		if (isVideoUrl(href)) {
			return (
				<video
					src={href}
					controls
					preload="metadata"
					style={{
						width: "100%",
						height: "auto",
						borderRadius: 8,
						margin: "12px 0",
						display: "block",
					}}
				/>
			);
		}

		return (
			<a href={href} target="_blank" rel="noopener noreferrer">
				{children}
			</a>
		);
	},
};
