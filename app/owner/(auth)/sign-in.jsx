import { useRouter } from "expo-router";

export default function SigninScreen() {
    const router = useRouter();
    
    router.replace("../../(auth)/sign-in");
}