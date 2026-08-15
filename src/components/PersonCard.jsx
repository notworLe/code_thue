import { Link } from "react-router-dom";
import { profileUrl } from "../api/tmdbApi";

export default function PersonCard({ person }) {
  const photo = profileUrl(person.profile_path, "w185");
  const knownFor = person.known_for_department || "";

  return (
    <Link to={`/person/${person.id}`} className="person-card">
      <div className="person-card-photo">
        {photo ? (
          <img src={photo} alt={person.name} loading="lazy" />
        ) : (
          <div className="person-card-no-photo">
            <span>👤</span>
          </div>
        )}
      </div>
      <div className="person-card-info">
        <h3 className="person-card-name">{person.name}</h3>
        {knownFor && <span className="person-card-role">{knownFor}</span>}
      </div>
    </Link>
  );
}
