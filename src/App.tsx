import RegisterForm from "./components/RegisterForm/RegisterForm";
import "./App.css";

function App() {
  return (
    <main>
      <div className="img-background">
        <h1 className="title">
          Czy widzisz tutaj swój nowy dom? Skontaktuj się z nami
          <br />
          <span>i porozmawiajmy o ofercie na działki!</span>
        </h1>
      </div>
      <div className="form-wrapper">
        <RegisterForm />
      </div>
    </main>
  );
}

export default App;
