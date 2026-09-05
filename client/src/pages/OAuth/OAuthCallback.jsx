import React, { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

const OAuthCallback = () => {
	const [searchParams] = useSearchParams();

	const { setLoggedinState } = useContext(AuthContext);

	useEffect(() => {
		const token = searchParams.get("token");

		if (!token) {
			return;
		}

		setLoggedinState(token);
	}, [searchParams, setLoggedinState]);

	return <div>Signing you in...</div>;
};

export default OAuthCallback;
